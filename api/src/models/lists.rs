use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};
use diesel::prelude::*;
use async_trait::async_trait;

use crate::errors::APIError;
use crate::schema::lists;
use super::helpers::{connect, Model};

#[derive(Queryable, Insertable, Identifiable, AsChangeset, Debug, Deserialize, Serialize, Clone)]
#[table_name="lists"]
pub struct TodoList {
	pub id: uuid::Uuid,
	pub name: String,
	pub created_at: chrono::NaiveDateTime,
	pub updated_at: chrono::NaiveDateTime,
}

#[async_trait]
impl Model for TodoList {
	async fn all() -> Result<Vec<TodoList>, APIError> {
		let connection = connect();

		let results = lists::table.load::<TodoList>(&connection);

		match results {
			Ok (results) => Ok(results),
			Err(e)       => Err(APIError::UnknownError(anyhow!(e)))
		}
	}

	async fn find(id: uuid::Uuid) -> Result<TodoList, APIError> {
		let connection = connect();
		let result = lists::table.find(id).get_result::<TodoList>(&connection);

		match result {
			Ok (result) => Ok(result),
			Err(e)      => {
				eprintln!("{:?}", e);
				Err(APIError::NotFoundId(id))
			}
		}
	}

	async fn save(&self) -> Result<bool, APIError> {
		todo!()
	}

	async fn create(&self) -> Result<uuid::Uuid, APIError> {
		todo!()
	}
}

