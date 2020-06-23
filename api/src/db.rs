use mongodb::{
	bson,
	bson::{doc, document::Document},
	options::{ClientOptions, FindOptions, FindOneOptions},
	Client,
	Collection,
	Database,
};

use tokio::stream::StreamExt;
use anyhow::{anyhow, Result};
use std::time::Duration;

pub struct DbCnx {
	client: Client,
	database: Database,
	collection: Collection,
}

impl DbCnx {
	pub async fn new(db_name: &str, collection_name: &str) -> Result<DbCnx> {
		let mut client_options = ClientOptions::parse("mongodb://localhost:27017").await?;
		client_options.connect_timeout = Some(Duration::new(5, 0));
		client_options.server_selection_timeout = Some(Duration::new(5, 0));

		let client     = Client::with_options(client_options)?;
		let db         = client.database(&db_name);
		let collection = db.collection(&collection_name);

		// Test the connection, otherwise return an error
		// This means we can error straight away rather than at query time
		client.list_databases(None, None).await?;

		Ok(DbCnx {
			client: client,
			database: db,
			collection: collection,
		})
	}

	pub async fn fetch(&self, id: &bson::oid::ObjectId) -> Result<Option<Document>> {
		let filter = doc! { "_id": id };
		let opt    = FindOneOptions::builder().build();
		let cursor = self.collection.find_one(filter, opt).await?;

		if let Some(doc) = cursor {
			match bson::from_bson(bson::Bson::Document(doc)) {
				Ok(doc) => return Ok(Some(doc)),
				Err(e) => return Err(anyhow!("DB parse error: {}", e)),
			}
		}

		Ok(None)
	}

	pub async fn fetch_all(&self) -> Result<Vec<Document>> {
		let opt = FindOptions::builder().show_record_id(false).build();
		let mut cursor = self.collection.find(None, opt).await?;

		let mut results = Vec::new();
		while let Some(result) = cursor.next().await {
			match bson::from_bson(bson::Bson::Document(result.unwrap())) {
				Ok(doc) => results.push(doc),
				Err(e) => eprintln!("BSON parse error: {:?}", e),
			}
		}

		Ok(results)
	}

	// Parses a string into an oid
	pub fn get_oid(id: &str) -> Result<bson::oid::ObjectId> {
		match bson::oid::ObjectId::with_string(&id) {
			Ok(oid) => Ok(oid),
			Err(e) => Err(anyhow!("Failed to create oid: {}", e)),
		}
	}
}
