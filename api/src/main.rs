use warp::{http::Method,Filter};
use serde_json;
use serde::Serialize;
use anyhow::{anyhow, Result};

mod errors;
mod models;
mod routes;
mod schema;

use crate::routes::{todos, ws};

#[macro_use]
extern crate diesel;
extern crate dotenv;
extern crate chrono;


#[tokio::main]
async fn main() {
	let routes = todos::load_routes().await.or(ws::load_routes().await);
	let cors = warp::cors()
		.allow_any_origin()
		.allow_headers(vec![
			"Accept",
			"Accept-Encoding",
			"Accept-Language",
			"Access-Control-Allow-Origin",
			"Access-Control-Request-Method",
			"Access-Control-Request-Headers",
			"Connection",
			"Content-Length",
			"Content-Type",
			"DNT",
			"Host",
			"Origin",
			"Referer",
			"User-Agent",
			"Sec-Fetch-Mode",
		])
		// .allow_headers(vec!["*"])
		.allow_methods(&[Method::POST, Method::GET, Method::PUT]);

	warp::serve(routes.with(cors).recover(errors::handle_err))
		.run(([127, 0, 0, 1], 3030))
		.await;
}

// No longer used but keeping in case it becomes useful
// JSON string to serialized json
fn _to_json<T>(data: T) -> Result<String> where T: Serialize {
	match serde_json::to_string(&data) {
		Ok(json) => Ok(json),
		Err(e) => Err(anyhow!(e)),
	}
}
