use crate::tinyget_grpc::{
    tinyget_grpc_client::TinygetGrpcClient, SoftsInstallRequests,
};

use log::error;

#[tauri::command]
pub async fn install(pkgs: Vec<String>) -> Result<(), String> {
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

    let resq = tonic::Request::new(SoftsInstallRequests { pkgs });
    let install_resp = match client.softs_install(resq).await {
        Ok(resp) => resp,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    }
    .into_inner();
    if install_resp.retcode != 0 {
        return Err(install_resp.stderr.unwrap());
    }
    Ok(())
}
