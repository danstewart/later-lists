use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};
use crate::db::DbCnx;
use crate::errors::APIError;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TodoItem {
	pub id: u32,
	pub title: String,
	pub body: String,
	pub completed: bool,
	pub archived: bool,
	pub created: String,
}

impl TodoItem {
	pub async fn all() -> Result<Vec<TodoItem>> {
		Ok(db().await?.fetch_all().await?)
	}

	pub async fn find(id: u32) -> Result<TodoItem, APIError> {
		match db().await?.fetch(id).await {
			Ok(result) => match result {
				Some(result) => Ok(result),
				None => Err(APIError::NotFoundId(id).into()),
			},
			Err(e) => Err(APIError::UnknownError(e).into()),
		}
	}

	pub async fn save(&self) -> Result<bool> {
		let doc = db().await?.fetch(self.id).await;

		match doc {
			Ok(doc) => println!("Got document: {:?}", doc),
			Err(e) => eprintln!("{}", e),
		}
	
		println!("Saving todo {}", self.id);
		Ok(true)
	}
}

async fn db() -> Result<DbCnx> {
	match DbCnx::new("laterlist", "todos").await {
		Ok(db) => Ok(db),
		Err(e) => Err(anyhow!("Failed to connect to database: {}", e)),
	}
}
