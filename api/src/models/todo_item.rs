use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};
use mongodb::bson;

use crate::db::DbCnx;
use crate::errors::APIError;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TodoItem {
	// A little bit hacky
	// I want to use OID internally but expose it as a string via the API
	// Having two optional fields and add in the id after querying seems to be the easiest solution
	#[serde(skip_serializing)]
	pub _id: Option<bson::oid::ObjectId>,

	#[serde(skip_serializing_if="Option::is_none")]
	pub id: Option<String>,

	pub title: String,
	pub body: String,
	pub completed: bool,
	pub archived: bool,
	pub created: String,
}

impl TodoItem {
	pub async fn all() -> Result<Vec<TodoItem>> {
		let docs = db().await?.fetch_all().await?;

		let mut results = Vec::new();
		for doc in docs {
			match parse_document(doc) {
				Ok(doc) => results.push(doc),
				Err(e) => eprintln!("{}", e),
			}
		}

		Ok(results)
	}

	pub async fn find(id: String) -> Result<TodoItem, APIError> {
		let oid = DbCnx::get_oid(&id)?;

		match db().await?.fetch(&oid).await {
			Ok(result) => match result {
				Some(result) => Ok(parse_document(result)?),
				None => Err(APIError::NotFoundId(id).into()),
			},

			Err(e) => Err(APIError::UnknownError(e).into()),
		}
	}

	pub async fn save(&self) -> Result<bool, APIError> {
		let oid: bson::oid::ObjectId;

		if let Some(id) = &self.id {
			oid = DbCnx::get_oid(&id)?;
		} else {
			return Err(APIError::UnknownError(anyhow!("Missing ID")));
		}

		let doc = db().await?.fetch(&oid).await;

		match doc {
			Ok(doc) => println!("Got document: {:?}", doc),
			Err(e) => eprintln!("{}", e),
		}
	
		println!("Saving todo {:?}", self.id);
		Ok(true)
	}
}

// Parses a bson::document::Document into a TodoItem
fn parse_document(doc: bson::document::Document) -> Result<TodoItem, APIError> {
	match bson::from_bson::<TodoItem>(bson::Bson::Document(doc)) {
		Ok(mut doc) => {
			doc.id = Some(doc._id.as_ref().map_or("".to_string(), |id| id.to_hex()));
			return Ok(doc);
		},
		Err(e) => return Err(APIError::UnknownError(anyhow!("DB parse error: {}", e))),
	}
}

// Returns a database handle
async fn db() -> Result<DbCnx, APIError> {
	match DbCnx::new("laterlists", "todos").await {
		Ok(db) => Ok(db),
		Err(e) => Err(APIError::UnknownError(anyhow!("Failed to connect to database: {}", e))),
	}
}
