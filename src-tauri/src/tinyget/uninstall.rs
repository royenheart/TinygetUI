use crate::tinyget_grpc::{
    tinyget_grpc_client::TinygetGrpcClient, SoftsUninstallRequests,
};

use log::error;

#[tauri::command]
pub async fn uninstall(pkgs: Vec<String>) -> Result<(), String> {
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

    let resq = tonic::Request::new(SoftsUninstallRequests { pkgs });
    let uninstall_resp = match client.softs_uninstall(resq).await {
        Ok(resp) => resp,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    }
    .into_inner();
    if uninstall_resp.retcode != 0 {
        return Err(uninstall_resp.stderr.unwrap());
    }
    Ok(())
}
