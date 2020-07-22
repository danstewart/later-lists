use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};
use diesel::prelude::*;
use diesel::pg::PgConnection;
use dotenv::dotenv;
use std::env;

use crate::errors::APIError;
use crate::schema::todos;

#[derive(Queryable, Insertable, Identifiable, AsChangeset, Debug, Deserialize, Serialize, Clone)]
#[table_name="todos"]
pub struct TodoItem {
	#[serde(skip_serializing_if="Option::is_none")]
	pub id: Option<i32>,
	pub title: String,
	pub body: String,
	pub completed: bool,
	pub archived: bool,
	pub created: chrono::NaiveDateTime,
}

impl TodoItem {
	pub async fn all() -> Result<Vec<TodoItem>, APIError> {
		let connection = connect();
		let results = todos::table.load::<TodoItem>(&connection);

		match results {
			Ok (results) => Ok(results),
			Err(e)       => Err(APIError::UnknownError(anyhow!(e)))
		}
	}

	pub async fn find(id: i32) -> Result<TodoItem, APIError> {
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

	pub async fn save(&self) -> Result<bool, APIError> {
		let connection = connect();

		let result: QueryResult<TodoItem> = diesel::update(todos::table.find(self.id))
			.set(self.clone())
			.get_result(&connection);

		match result {
			Ok (_) => Ok(true),
			Err(e) => Err(APIError::UnknownError(e.into()))
		}
	}

	pub async fn create(&self) -> Result<i32, APIError> {
		let connection = connect();

		let result: QueryResult<TodoItem> = diesel::insert_into(todos::table)
			.values(self.clone())
			.get_result(&connection);

		match result {
			Ok (result) => Ok(result.id.unwrap()),
			Err(e)      => Err(APIError::UnknownError(e.into()))
		}
	}
}

pub fn connect() -> PgConnection {
	dotenv().ok();

	let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
	PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}
