package faceTime.product;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * 피부 타입별 제품을 조회합니다.
     * @param skinType (Optional) "지성", "건성", "복합성"
     * @return DTO로 변환된 제품 목록
     */
    public List<ProductDto.ProductResponse> getProducts(String skinType) {
        List<Product> products;

        if (skinType == null || skinType.isBlank()) {
            // 1. 쿼리 파라미터가 없으면 모든 제품 조회
            products = productRepository.findAll();
        } else {
            // 2. 쿼리 파라미터가 있으면, 해당 타입 + '모든피부' 제품 조회
            products = productRepository.findMatchingProducts(skinType);
        }

        // 엔티티 리스트를 DTO 리스트로 변환하여 반환
        return products.stream()
                .map(ProductDto.ProductResponse::new)
                .collect(Collectors.toList());
    }
}