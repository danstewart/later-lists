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
		let results = lists::table.load::<TodoList>(&connect());

		match results {
			Ok (results) => Ok(results),
			Err(e)       => Err(APIError::UnknownError(anyhow!(e)))
		}
	}

	async fn find(id: uuid::Uuid) -> Result<TodoList, APIError> {
		let result = lists::table.find(id).get_result::<TodoList>(&connect());

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
		if let Err(_) = TodoList::find(self.id).await {
			return self.create().await;
		}

		// NOTE: Manually set each field since we don't want to change `created_at`
		// and there isn't a (good) way to skip a AsChangeset field
		// See https://github.com/diesel-rs/diesel/issues/860
		let result: QueryResult<TodoList> = diesel::update(lists::table.find(self.id))
			.set((
				lists::name.eq(&self.name),
				lists::updated_at.eq(chrono::Utc::now().naive_utc())
			))
			.get_result(&connect());

		match result {
			Ok (result) => Ok(result.id),
			Err(e)      => Err(APIError::UnknownError(e.into()))
		}
	}

	async fn create(&self) -> Result<uuid::Uuid, APIError> {
		// If it exists then call save() instead
		if let Ok(_) = TodoList::find(self.id).await {
			return self.save().await;
		}

		let result: QueryResult<TodoList> = diesel::insert_into(lists::table)
			.values(self.clone())
			.get_result(&connect());

		match result {
			Ok (todo) => Ok(todo.id),
			Err(e)    => Err(APIError::UnknownError(e.into()))
		}
	}
}

