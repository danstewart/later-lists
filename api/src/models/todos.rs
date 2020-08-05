use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};
use diesel::prelude::*;
use async_trait::async_trait;

use crate::errors::APIError;
use crate::schema::todos;
use super::lists::{TodoList};
use super::helpers::{connect, Model};

#[derive(Queryable, Insertable, Identifiable, AsChangeset, Associations, Debug, Deserialize, Serialize, Clone)]
#[belongs_to(TodoList)]
#[table_name="todos"]
pub struct TodoItem {
	pub id: uuid::Uuid,
	pub title: String,
	pub body: String,
	pub completed: bool,
	pub archived: bool,
	pub todo_list_id: uuid::Uuid,
	pub created_at: chrono::NaiveDateTime,
	pub updated_at: chrono::NaiveDateTime,
}

#[async_trait]
impl Model for TodoItem {
	async fn all(filter: Option<HashMap<String, String>>) -> Result<Vec<TodoItem>, APIError> {
		let results = match filter {
			// TODO: Fix this monstrosity
			Some(filter) => todos::table.filter(todos::todo_list_id.eq(uuid::Uuid::parse_str(filter.get("list_id").unwrap()).unwrap())).load::<TodoItem>(&connect()),
			None         => todos::table.load::<TodoItem>(&connect()),
		};

		match results {
			Ok (results) => Ok(results),
			Err(e)       => Err(APIError::UnknownError(anyhow!(e)))
		}
	}

	async fn find(id: uuid::Uuid) -> Result<TodoItem, APIError> {
		let result = todos::table.find(id).get_result::<TodoItem>(&connect());

		match result {
			Ok (result) => Ok(result),
			Err(e)      => {
				eprintln!("{:?}", e);
				Err(APIError::NotFoundId(id))
			}
		}
	}

	async fn save(&self) -> Result<uuid::Uuid, APIError> {
		// If it doesn't exist then call create() instead
		if let Err(_) = TodoItem::find(self.id).await {
			return self.create().await;
		}

		// NOTE: Manually set each field since we don't want to change `created_at`
		// and there isn't a (good) way to skip a AsChangeset field
		// See https://github.com/diesel-rs/diesel/issues/860
		let result: QueryResult<TodoItem> = diesel::update(todos::table.find(self.id))
			.set((
				todos::title.eq(&self.title),
				todos::body.eq(&self.body),
				todos::completed.eq(&self.completed),
				todos::archived.eq(&self.archived),
				todos::updated_at.eq(chrono::Utc::now().naive_utc())
			))
			.get_result(&connect());

		match result {
			Ok (result) => Ok(result.id),
			Err(e)      => Err(APIError::UnknownError(e.into()))
		}
	}

	async fn create(&self) -> Result<uuid::Uuid, APIError> {
		// If it exists then call save() instead
		if let Ok(_) = TodoItem::find(self.id).await {
			return self.save().await;
		}

		let result: QueryResult<TodoItem> = diesel::insert_into(todos::table)
			.values(self.clone())
			.get_result(&connect());

		match result {
			Ok (todo) => Ok(todo.id),
			Err(e)    => Err(APIError::UnknownError(e.into()))
		}
	}
}
