use warp::{Filter, Reply, reject, filters::BoxedFilter};
use anyhow::{Result};
use super::helpers::{http_ok};

use crate::models::todos::{TodoItem};

pub async fn load_routes() -> BoxedFilter<(impl Reply,)> {
	// PUT: /api/todo
	let add = warp::put()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::end())
		.and(json_body())
		.and_then(add_todo);

	// GET: /api/todo/:id
	let get = warp::get()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::param::<i32>())
		.and(warp::path::end())
		.and_then(get_todo);

	// GET: /api/todo
	let all = warp::get()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::end())
		.and_then(get_all_todos);

	// POST: /api/todo/:id
	let update = warp::post()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::param::<i32>())
		.and(warp::path::end())
		.and(json_body())
		.and_then(update_todo);

	// Return the routes
	add.or(get).or(all).or(update).boxed()
}

// GET /api/todo/3
async fn get_todo(id: i32) -> Result<impl warp::Reply, warp::Rejection> {
	match TodoItem::find(id).await {
		Ok (result) => Ok(warp::reply::json(&result)),
		Err(e)      => Err(reject::custom(e)),
	}
}

// GET /api/todo
async fn get_all_todos() -> Result<impl warp::Reply, warp::Rejection> {
	match TodoItem::all().await {
		Ok (results) => Ok(warp::reply::json(&results)),
		Err(e)       => Err(reject::custom(e)),
	}
}

// PUT /api/todo
async fn add_todo(mut todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	// Ensure an ID wasn't specified
	todo.id = None;

	match todo.create().await {
		Ok(id) => Ok(http_ok(format!("Created todo `{:?}`", id))),
		Err(e) => Err(reject::custom(e)),
	}
}

// POST /api/todo/3
async fn update_todo(id: i32, mut todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	// Ensure the ID is specified
	todo.id = Some(id);

	match todo.save().await {
		Ok (_) => Ok(http_ok(format!("Updated todo '{:?}'", todo.id.unwrap()))),
		Err(e) => Err(reject::custom(e)),
	}

}

// Parse json req body
fn json_body() -> impl Filter<Extract = (TodoItem,), Error = warp::Rejection> + Clone {
	warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}
