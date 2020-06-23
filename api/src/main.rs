use warp::Filter;
use serde_json;
use serde::Serialize;
use anyhow::{anyhow, Result};

mod db;
mod errors;
mod models;
mod routes;

use crate::routes::todos;

#[tokio::main]
async fn main() {
	let routes = todos::load_routes().await;

	warp::serve(routes.recover(errors::handle_err))
		.run(([127, 0, 0, 1], 3030))
		.await;
}

// No longer used but keeping in case it becomes useful
fn _to_json<T>(data: T) -> Result<String> where T: Serialize {
	match serde_json::to_string(&data) {
		Ok(json) => Ok(json),
		Err(e) => Err(anyhow!(e)),
	}
}
