pub mod todos;
pub mod lists;

/*
* Shared model logic
*/

// Establish database connection
use diesel::prelude::*;
use diesel::pg::PgConnection;
use dotenv::dotenv;
use std::env;

fn connect() -> PgConnection {
	dotenv().ok();

	let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
	PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

// Base model trait
use anyhow::Result;
use crate::errors::APIError;
use async_trait::async_trait;

#[async_trait]
pub trait Model where Self: Sized {
	async fn all()                -> Result<Vec<Self>, APIError>;
	async fn find(id: uuid::Uuid) -> Result<Self, APIError>;
	async fn save(&self)          -> Result<bool, APIError>;
	async fn create(&self)        -> Result<bool, APIError>;
}
