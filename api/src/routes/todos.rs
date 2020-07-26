use warp::{Filter, Reply, reject, filters::BoxedFilter};
use serde::{Deserialize, Serialize};
use anyhow::{Result};
use super::helpers::{http_ok};

use crate::models::{
	Model,
	todos::TodoItem,
	lists::TodoList,
};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct TodoRequest {
	id: Option<uuid::Uuid>,
	title: String,
	body: String,
	completed: bool,
	archived: bool,
	todo_list_id: Option<uuid::Uuid>,
	created_at: chrono::NaiveDateTime,
	updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct TodoResponse {
	id: uuid::Uuid,
	title: String,
	body: String,
	completed: bool,
	archived: bool,
	todo_list_id: Option<uuid::Uuid>,
	todo_list_name: Option<String>,
	created_at: chrono::NaiveDateTime,
	updated_at: chrono::NaiveDateTime,
}

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
		.and(warp::path::param::<uuid::Uuid>())
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
		.and(warp::path::param::<uuid::Uuid>())
		.and(warp::path::end())
		.and(json_body())
		.and_then(update_todo);

	// Return the routes
	add.or(get).or(all).or(update).boxed()
}

// GET /api/todo/3
async fn get_todo(id: uuid::Uuid) -> Result<impl warp::Reply, warp::Rejection> {
	let todo = match TodoItem::find(id).await {
		Ok  (todo) => todo,
		Err(e)     => return Err(reject::custom(e)),
	};

	// If not in a list just return the todo
	let list_id = match todo.todo_list_id {
		Some(list_id) => list_id,
		None          => return Ok(warp::reply::json(&todo))
	};

	let list = match TodoList::find(list_id).await {
		Ok (list) => list,
		Err(e)    => return Err(reject::custom(e))
	};

	let response = TodoResponse {
		id: todo.id,
		title: todo.title,
		body: todo.body,
		completed: todo.completed,
		archived: todo.archived,
		todo_list_id: Some(list.id),
		todo_list_name: Some(list.name),
		created_at: todo.created_at,
		updated_at: todo.updated_at,
	};

	Ok(warp::reply::json(&response))
}

// GET /api/todo
async fn get_all_todos() -> Result<impl warp::Reply, warp::Rejection> {
	match TodoItem::all().await {
		Ok (results) => Ok(warp::reply::json(&results)),
		Err(e)       => Err(reject::custom(e)),
	}
}

// PUT /api/todo
async fn add_todo(todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	// Ensure an ID wasn't specified
	// todo.id = uuid::Uuid::default();

	match todo.create().await {
		Ok(id) => Ok(http_ok(format!("Created todo `{:?}`", id))),
		Err(e) => Err(reject::custom(e)),
	}
}

// POST /api/todo/3
async fn update_todo(id: uuid::Uuid, mut todo: TodoItem) -> Result<impl warp::Reply, warp::Rejection> {
	// Ensure the ID is specified
	todo.id = id;

	match todo.save().await {
		Ok (_) => Ok(http_ok(format!("Updated todo '{:?}'", todo.id))),
		Err(e) => Err(reject::custom(e)),
	}

}

// Parse json req body
fn json_body() -> impl Filter<Extract = (TodoItem,), Error = warp::Rejection> + Clone {
	warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}
