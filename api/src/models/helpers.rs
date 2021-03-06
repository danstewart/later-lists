/*
* Shared model logic
*/

// Establish database connection
use diesel::prelude::*;
use diesel::pg::PgConnection;
use dotenv::dotenv;

pub fn connect() -> PgConnection {
	dotenv().ok();

	let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
	PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}


// Base model trait
use std::{collections::HashMap, env};
use anyhow::Result;
use crate::errors::APIError;
use async_trait::async_trait;

#[async_trait]
pub trait Model where Self: Sized {
	async fn all(filter: Option<HashMap<String, String>>) -> Result<Vec<Self>, APIError>;
	async fn find(id: uuid::Uuid) -> Result<Self, APIError>;
	async fn save(&self) -> Result<uuid::Uuid, APIError>;
	async fn create(&self) -> Result<uuid::Uuid, APIError>;
}
