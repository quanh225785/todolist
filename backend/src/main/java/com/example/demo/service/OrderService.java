package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Order;
import com.example.demo.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Order upsertOrderFromWebhook(Map<String, Object> payload) {
        // payload expected to include order_invoice_number and transaction_id and status
        String invoice = firstString(payload, "order_invoice_number", "orderInvoiceNumber", "invoice_number", "invoice");
        String txId = firstString(payload, "transaction_id", "transactionId", "tx_id");
        String status = firstString(payload, "status", "payment_status", "status_code");

        Long amount = null;
        Object amt = payload.get("order_amount");
        if (amt == null) amt = payload.get("amount");
        if (amt != null) {
            try { amount = Long.valueOf(String.valueOf(amt)); } catch (Exception e) { amount = null; }
        }

        Order order = null;
        if (invoice != null) {
            order = orderRepository.findByInvoiceNumber(invoice).orElse(null);
        }
        if (order == null && txId != null) {
            order = orderRepository.findByTransactionId(txId).orElse(null);
        }

        if (order == null) {
            order = new Order();
            order.setInvoiceNumber(invoice);
            order.setCreatedAt(LocalDateTime.now());
        }

        // idempotency: if transaction id already recorded and status same, skip update
        if (txId != null && txId.equals(order.getTransactionId()) && status != null && status.equals(order.getStatus())) {
            return orderRepository.save(order);
        }

        if (txId != null) order.setTransactionId(txId);
        if (amount != null) order.setAmount(amount);
        if (payload.get("currency") != null) order.setCurrency(String.valueOf(payload.get("currency")));
        if (status != null) order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    private String firstString(Map<String, Object> payload, String... keys) {
        for (String k : keys) {
            Object v = payload.get(k);
            if (v != null) return String.valueOf(v);
        }
        return null;
    }
}
