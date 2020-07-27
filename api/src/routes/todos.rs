use warp::{Filter, Reply, reject, filters::BoxedFilter};
use serde::{Deserialize, Serialize};
use anyhow::{Result};
use super::helpers::{http_ok};

use crate::models::{
	helpers::Model,
	todos::TodoItem,
	lists::TodoList,
};

/*
* Data structures
*/
#[derive(Debug, Deserialize, Serialize, Clone)]
struct TodoRequest {
	id: Option<uuid::Uuid>,
	title: String,
	body: String,
	completed: bool,
	archived: bool,
	todo_list_id: Option<uuid::Uuid>,
}

impl TodoRequest {
	fn into_todo_item(&self) -> TodoItem {
		let uuid = match self.id {
			Some(id) => id,
			None     => uuid::Uuid::new_v4()
		};

		TodoItem {
			id: uuid,
			title: self.title.clone(),
			body: self.body.clone(),
			completed: self.completed,
			archived: self.archived,
			todo_list_id: self.todo_list_id,
			created_at: chrono::Utc::now().naive_utc(),
			updated_at: chrono::Utc::now().naive_utc(),
		}
	}
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

impl TodoResponse {
	fn from_todo_and_list(todo: TodoItem, list: TodoList) -> Self {
		TodoResponse {
			id: todo.id,
			title: todo.title,
			body: todo.body,
			completed: todo.completed,
			archived: todo.archived,
			todo_list_id: Some(list.id),
			todo_list_name: Some(list.name),
			created_at: todo.created_at,
			updated_at: todo.updated_at,
		}
	}

	fn from_todo(todo: TodoItem) -> Self {
		TodoResponse {
			id: todo.id,
			title: todo.title,
			body: todo.body,
			completed: todo.completed,
			archived: todo.archived,
			todo_list_id: None,
			todo_list_name: None,
			created_at: todo.created_at,
			updated_at: todo.updated_at,
		}
	}
}

/*
* Routes
*/
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

	let response = TodoResponse::from_todo_and_list(todo, list);
	Ok(warp::reply::json(&response))
}

// GET /api/todo
async fn get_all_todos() -> Result<impl warp::Reply, warp::Rejection> {
	let todos = match TodoItem::all().await {
		Ok (todos) => todos,
		Err(e)     => return Err(reject::custom(e)),
	};

	let mut results = Vec::<TodoResponse>::new();
	for todo in todos {
		let result: TodoResponse;

		// TODO: Can obj cache this
		if let Some(id) = todo.todo_list_id {
			let list = TodoList::find(id).await.unwrap(); // TODO: Error handling
			result = TodoResponse::from_todo_and_list(todo, list);
		} else {
			result = TodoResponse::from_todo(todo);
		}

		results.push(result);
	}

	Ok(warp::reply::json(&results))
}

// PUT /api/todo
async fn add_todo(request: TodoRequest) -> Result<impl warp::Reply, warp::Rejection> {
	let todo = request.into_todo_item();

	match todo.create().await {
		Ok(id) => Ok(http_ok(
			format!("Created todo `{}`", request.title),
			id,
		)),
		Err(e) => Err(reject::custom(e)),
	}
}

// POST /api/todo/3
async fn update_todo(id: uuid::Uuid, mut request: TodoRequest) -> Result<impl warp::Reply, warp::Rejection> {
	request.id = Some(id);
	let todo = request.into_todo_item();

	match todo.save().await {
		Ok (_) => Ok(http_ok(
			format!("Updated todo '{}'", todo.title),
			todo.id,
		)),
		Err(e) => Err(reject::custom(e)),
	}

}

/*
* Helpers
*/
// Parse json req body
fn json_body() -> impl Filter<Extract = (TodoRequest,), Error = warp::Rejection> + Clone {
	warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}
