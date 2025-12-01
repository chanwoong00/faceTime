package faceTime.product;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products") // 제품 API 경로
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 제품 목록 조회 API
     * (예: /api/products) -> 모든 제품
     * (예: /api/products?skinType=지성) -> 지성용 + 모든피부용 제품
     */
    @GetMapping
    public ResponseEntity<List<ProductDto.ProductResponse>> getProducts(
            @RequestParam(required = false) String skinType
    ) {
        List<ProductDto.ProductResponse> products = productService.getProducts(skinType);
        return ResponseEntity.ok(products);
    }
}