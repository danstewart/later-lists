use warp::{http, Filter, reject};
use serde_json;
use serde::Serialize;
use anyhow::{anyhow, Result};

mod errors;
use errors::APIError;
mod db;

mod models;
use models::todo_item::TodoItem;

#[tokio::main]
async fn main() {
	let add = warp::post()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::end())
		.and(json_body())
		.and_then(add_todo);

	let get = warp::get()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::param::<u32>())
		.and(warp::path::end())
		.and_then(get_todo);

	let all = warp::get()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::end())
		.and_then(get_all_todos);

	let update = warp::put()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::param::<u32>())
		.and(warp::path::end())
		.and(json_body())
		.and_then(update_todo);

	let routes = add.or(get).or(all).or(update).recover(errors::handle_err);

	warp::serve(routes)
		.run(([127, 0, 0, 1], 3030))
		.await;
}

// GET /api/todo/3
async fn get_todo(id: u32) -> Result<impl warp::Reply, warp::Rejection> {
	match TodoItem::find(id).await {
		Ok(result) => Ok(warp::reply::json(&result)),
		Err(e) => Err(reject::custom(e)),
	}
}

// GET /api/todo
async fn get_all_todos() -> Result<impl warp::Reply, warp::Rejection> {
	match TodoItem::all().await {
		Ok(results) => Ok(warp::reply::json(&results)),
		Err(e) => Err(reject::custom(APIError::UnknownError(e))),
	}
}

// POST /api/todo
async fn add_todo(todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	todo.save().await;

	Ok(warp::reply::with_status(
		format!("Added item '{}'", todo.title),
		http::StatusCode::OK,
	))
}

// PUT /api/todo/3
async fn update_todo(id: u32, todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	todo.save().await;

	Ok(warp::reply::with_status(
		format!("Updated todo {} with title '{}'", id, todo.title),
		http::StatusCode::OK,
	))
}

/* JSON helpers */
// Parse json req body
fn json_body() -> impl Filter<Extract = (TodoItem,), Error = warp::Rejection> + Clone {
	warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}

// No longer used but keeping in case I do need it
fn _to_json<T>(data: T) -> Result<String> where T: Serialize {
	match serde_json::to_string(&data) {
		Ok(json) => Ok(json),
		Err(e) => Err(anyhow!(e)),
	}
}
