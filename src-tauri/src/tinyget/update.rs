use crate::tinyget_grpc::{
    tinyget_grpc_client::TinygetGrpcClient, SysUpdateRequest,
};

use log::error;

#[tauri::command]
pub async fn update(upgrade: bool) -> Result<(), String> {
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

    let resq = tonic::Request::new(SysUpdateRequest { upgrade });
    let update_resp = match client.sys_update(resq).await {
        Ok(resp) => resp,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    }
    .into_inner();
    if update_resp.retcode != 0
        && update_resp.stderr.clone().is_some_and(|s| !s.is_empty())
    {
        return Err(update_resp.stderr.unwrap());
    }
    Ok(())
}
