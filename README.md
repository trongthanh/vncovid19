# Vietnam COVID-19 Open data and tracker

Dữ liệu mở thu thập từ trang [thông tin chính thức](https://ncov.moh.gov.vn) của [Bộ Y Tế Việt Nam](https://moh.gov.vn), dùng cho data visualization.

## Mô tả trường dữ liệu:

```js
{
    "17": // số thứ tự bệnh nhân, xem như ID
    {
        "gender": "female", // male or female
        "age": 26,
        "residence": "Hà Nội",     // nơi cư trú
        "nationality": "Việt Nam", // quốc tịch
        "positiveDate": "2020-03-06", // ngày xác nhận dương tính
        "status": "positive",      // tình trạng hiện tại
        "flights": ["VN0054"],     // mã chuyến bay
        "source": ["Anh"],         // nguồn từ (nước ngoài hoặc mã BN)
        "description": "Nữ 26 tuổi đi thăm chị gái tại Anh và qua Italy, Pháp và trở về Hà Nội ngày 2/3/2020"
    }
}
```
