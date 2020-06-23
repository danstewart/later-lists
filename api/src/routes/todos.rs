use warp::{http, Filter, Reply, reject, filters::BoxedFilter};
use anyhow::Result;

use crate::models::todo_item::TodoItem;
use crate::errors::APIError;

pub async fn load_routes() -> BoxedFilter<(impl Reply,)> {
	let add = warp::post()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::end())
		.and(json_body())
		.and_then(add_todo);

	let get = warp::get()
		.and(warp::path("api"))
		.and(warp::path("todo"))
		.and(warp::path::param::<String>())
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
		.and(warp::path::param::<String>())
		.and(warp::path::end())
		.and(json_body())
		.and_then(update_todo);

	// Return the routes
	add.or(get).or(all).or(update).boxed()
}

// GET /api/todo/3
async fn get_todo(id: String) -> Result<impl warp::Reply, warp::Rejection> {
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
	// TODO
	todo.save().await;

	Ok(warp::reply::with_status(
		format!("Added item '{}'", todo.title),
		http::StatusCode::OK,
	))
}

// PUT /api/todo/3
async fn update_todo(id: String, todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	// TODO
	todo.save().await;

	Ok(warp::reply::with_status(
		format!("Updated todo `{}`", id),
		http::StatusCode::OK,
	))
}

/* JSON helpers */
// Parse json req body
fn json_body() -> impl Filter<Extract = (TodoItem,), Error = warp::Rejection> + Clone {
	warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}
