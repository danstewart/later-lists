use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};
use diesel::prelude::*;
use async_trait::async_trait;

use crate::errors::APIError;
use crate::schema::todos;
use super::lists::{TodoList};
use super::{connect, Model};

#[derive(Queryable, Insertable, Identifiable, AsChangeset, Associations, Debug, Deserialize, Serialize, Clone)]
#[belongs_to(TodoList)]
#[table_name="todos"]
pub struct TodoItem {
	pub id: uuid::Uuid,
	pub title: String,
	pub body: String,
	pub completed: bool,
	pub archived: bool,
	pub todo_list_id: Option<uuid::Uuid>,
	pub created_at: chrono::NaiveDateTime,
	pub updated_at: chrono::NaiveDateTime,
}

#[async_trait]
impl Model for TodoItem {
	async fn all() -> Result<Vec<TodoItem>, APIError> {
		let connection = connect();
		let results = todos::table.load::<TodoItem>(&connection);

		match results {
			Ok (results) => Ok(results),
			Err(e)       => Err(APIError::UnknownError(anyhow!(e)))
		}
	}

	async fn find(id: uuid::Uuid) -> Result<TodoItem, APIError> {
		let connection = connect();
		let result = todos::table.find(id).get_result::<TodoItem>(&connection);

		match result {
			Ok (result) => Ok(result),
			Err(e)      => {
				eprintln!("{:?}", e);
				Err(APIError::NotFoundId(id))
			}
		}
	}

	async fn save(&self) -> Result<bool, APIError> {
		let connection = connect();

		let result: QueryResult<TodoItem> = diesel::update(todos::table.find(self.id))
			.set(self.clone())
			.get_result(&connection);

		match result {
			Ok (_) => Ok(true),
			Err(e) => Err(APIError::UnknownError(e.into()))
		}
	}

	async fn create(&self) -> Result<bool, APIError> {
		let connection = connect();

		let result: QueryResult<TodoItem> = diesel::insert_into(todos::table)
			.values(self.clone())
			.get_result(&connection);

		match result {
			Ok (_) => Ok(true),
			Err(e)      => Err(APIError::UnknownError(e.into()))
		}
	}
}
