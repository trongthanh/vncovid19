# Vietnam COVID-19 Open Data and Visualization

Dữ liệu mở thu thập từ trang [thông tin chính thức](https://ncov.moh.gov.vn) của [Bộ Y Tế Việt Nam](https://moh.gov.vn), dùng cho data visualization.

Một số thông tin được thu thập bổ sung từ trang [Wiki Đại dịch COVID-19 tại Việt Nam](https://vi.wikipedia.org/wiki/%C4%90%E1%BA%A1i_d%E1%BB%8Bch_COVID-19_t%E1%BA%A1i_Vi%E1%BB%87t_Nam).

## Các biểu đồ

- Biểu đồ tổng quan các ca bệnh và nguồn lây: [vncovid19.github.io](http://vncovid19.github.io)

## Dữ liệu JSON

- Dữ liệu bệnh nhân: https://vncovid19.github.io/data/patients.json
- Dữ liệu bổ sung (nguồn lây): https://vncovid19.github.io/data/sources.json

## Mô tả trường dữ liệu:

**flights.json**: Dữ liệu chuyến bay (chưa hoàn thiện)

**sources.json**: Dữ liệu (bổ sung) nguồn lây: quốc gia, ổ dịch

**patients.json**: Dữ liệu các ca bệnh.

```js
{
    "17": // số thứ tự bệnh nhân, xem như ID
    {
        "positiveDate": "2020-03-06",  // ngày xác nhận dương tính
        "dischargeDate": "2020-03-22", // ngày xác xác nhận khỏi bệnh
        "gender": "female",            // male or female, để trống nếu không
        "age": 26,                     // tuổi, gán -1 nếu không có
        "treatmentLocation": "Hà Nội", // địa phương nơi bệnh nhân được chữa
        "residence": "Hà Nội",         // nơi cư trú
        "nationality": "Việt Nam",     // quốc tịch
        "status": "positive",          // tình trạng hiện tại (positive, negative, deceased)
        "flights": ["VN0054"],         // mã (các) chuyến bay
        "source": ["GB"],              // nguồn lây từ (mã quốc gia, ổ dịch hoặc mã BN)
        "description": "Nữ 26 tuổi đi thăm chị gái tại Anh và qua Italy, Pháp và trở về Hà Nội ngày 2/3/2020"
    }
}
```

## Tài nguyên

- Thư viện tạo biểu đồ D3: https://d3js.org
- Các biểu đồ viết bằng D3 để tham khảo: https://observablehq.com/@d3/gallery
- Icon cờ các nước: https://freeflagicons.com/buy/round_icon
- Danh sách mã quốc gia 2 ký tự ISO-3166: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes

## Đóng góp

Bạn có thể đóng góp bằng cách gửi pull request:

- Bổ sung hoặc sửa lỗi data (vui lòng open PR trước để người khác biết data sẽ được cập nhật phần nào)
- Thêm các đồ thị giúp giải thích dữ liệu một cách trực quan

---
© 2020 [vncovid19.github.io](https://vncovid19.github.io) and contributors. This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/). [![CC-By-4.0](https://i.creativecommons.org/l/by/4.0/80x15.png)](http://creativecommons.org/licenses/by/4.0/)

