const fs = require('fs');
let libPath;
const oracledb = require('oracledb');

function oracleinitpath(){


  console.log('Inside Oracle Path Initialization!!!')

  console.log('process.platform',process.platform)

if (process.platform === 'win32') {           // Windows
  libPath = 'C:\\oracle\\instantclient_21_3';
  libPath=process.env.MAKRO_NODEORCL;
  console.log('Library Path:'+libPath);
} else if (process.platform === 'darwin') {   // macOS
  libPath =  'D:\\instantclient_19_11';
}else{
  libPath='/usr/app/instantclient_21_9'
}


if (libPath && fs.existsSync(libPath)) {
  oracledb.initOracleClient({ libDir: libPath });
}

}

module.exports.oracleinitpath= oracleinitpath;