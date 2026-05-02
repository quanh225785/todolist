package com.example.demo.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentViewController {

    @GetMapping(value = "/payment/success", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> success() {
        String html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Payment Success</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;text-align:center;padding:40px;\">" +
                "<h1 style=\"color:green\">Thanh toán thành công</h1>" +
                "<p>Cảm ơn bạn, đơn hàng đã được thanh toán.</p>" +
                "</body></html>";
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping(value = "/payment/error", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> error() {
        String html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Payment Error</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;text-align:center;padding:40px;\">" +
                "<h1 style=\"color:red\">Thanh toán thất bại</h1>" +
                "<p>Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>" +
                "</body></html>";
        return ResponseEntity.status(400).contentType(MediaType.TEXT_HTML).body(html);
    }

    @GetMapping(value = "/payment/cancel", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> cancel() {
        String html = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Payment Canceled</title></head><body style=\"font-family:Arial,Helvetica,sans-serif;text-align:center;padding:40px;\">" +
                "<h1 style=\"color:orange\">Thanh toán bị huỷ</h1>" +
                "<p>Bạn đã hủy thanh toán. Nếu bạn cần hỗ trợ, vui lòng liên hệ chúng tôi.</p>" +
                "</body></html>";
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }
}
