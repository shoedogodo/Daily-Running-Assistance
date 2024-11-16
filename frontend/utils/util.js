const server_URL = "https://localhost:3000";
//const server_URL = "https://124.221.96.133";

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${[year, month, day].map(formatNumber).join('/')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

//弧度
function toRadians(d){
    return d*Math.PI/180
  }
//利用两点的经度，维度计算两点距离
function getDistance(lat1,lng1,lat2,lng2){
    const R=6378137 //赤道半径
    let dis=0
    let deltaLat=toRadians(lat1)-toRadians(lat2)
    let deltaLng=toRadians(lng1)-toRadians(lng2)
    let radLat1 = toRadians(lat1);
    let radLat2 = toRadians(lat2);
    dis=2*R*Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat/2),2)
    +Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(deltaLng/2),2)))
    return dis
}
 
module.exports = {
  formatTime,
  formatDate,
  getDistance
}
