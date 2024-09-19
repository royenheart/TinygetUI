use crate::tinyget_grpc::{
    tinyget_grpc_client::TinygetGrpcClient, SysHistoryRequest,
};

use log::error;
use serde::Serialize;

#[derive(Default, Serialize)]
pub struct History {
    id: String,
    command: String,
    date: String,
    operations: Vec<String>,
}

#[tauri::command]
pub async fn histories() -> Result<Vec<History>, String> {
    let mut client = match TinygetGrpcClient::connect("http://[::]:5051").await
    {
        Ok(client) => client,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    };

    let resq = tonic::Request::new(SysHistoryRequest { });
    let mut stream_his = match client.sys_history_stream(resq).await {
        Ok(resp) => resp,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    }
    .into_inner();
    let mut ret_his = vec![];
    while let Some(s) = match stream_his.message().await {
        Ok(x) => x,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    } {
        ret_his.push(History {
            id: s.id,
            command: s.command,
            date: s.date,
            operations: s.operations,
        });
    }
    Ok(ret_his)
}
