package com.example.demo.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PaymentWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentWebhookController.class);

    @Value("${SEPAY_SECRET_KEY:}")
    private String sepaySecret;

    private final ObjectMapper mapper = new ObjectMapper();

    private final OrderService orderService;

    @PostMapping("/api/payment/webhook")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request, @RequestBody String body) {
        try {
            String signature = request.getHeader("X-Sepay-Signature");
            if (signature == null) signature = request.getHeader("x-sepay-signature");
            if (signature == null || signature.isEmpty()) {
                logger.warn("Missing SePay signature header");
                return ResponseEntity.badRequest().body("missing signature");
            }

            if (sepaySecret == null || sepaySecret.isEmpty()) {
                logger.warn("SEPAY_SECRET_KEY not configured on server");
                return ResponseEntity.status(500).body("server misconfigured");
            }

            // strip possible prefix like "sha256="
            if (signature.startsWith("sha256=") || signature.startsWith("SHA256=")) {
                signature = signature.substring(signature.indexOf('=') + 1);
            }

            // compute expected HMAC-SHA256 hex
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(sepaySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] computed = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            String expected = bytesToHex(computed);

            boolean valid = MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
            if (!valid) {
                logger.warn("Invalid SePay webhook signature. expected={} received={}", expected, signature);
                return ResponseEntity.status(400).body("invalid signature");
            }

            // parse payload and handle event
            Map<String, Object> payload = mapper.readValue(body, Map.class);
            logger.info("SePay webhook received: {}", payload);

            // Update or insert order record based on payload (idempotent)
            try {
                orderService.upsertOrderFromWebhook(payload);
            } catch (Exception e) {
                logger.error("Error updating order from webhook", e);
                return ResponseEntity.status(500).body("order_update_failed");
            }

            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            logger.error("Error processing SePay webhook", e);
            return ResponseEntity.status(500).body("internal_error");
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b & 0xff));
        return sb.toString();
    }
}
