import moment from "moment-timezone"

// Đặt múi giờ mong muốn (ví dụ: Asia/Ho_Chi_Minh cho GMT+7)
const timezone = 'Asia/Ho_Chi_Minh';

// Lấy thời gian hiện tại dưới dạng mili giây
function getCurrentTime() {
    return moment().tz(timezone).valueOf();
}

export default getCurrentTime