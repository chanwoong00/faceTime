package faceTime.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * 특정 피부 타입에 맞는 제품을 조회합니다.
     * 이 때, '모든피부'로 등록된 제품도 함께 반환합니다.
     * @param userSkinType 사용자의 피부 타입 (예: "지성")
     * @return 제품 리스트
     */
    @Query("SELECT p FROM Product p WHERE p.skinType = :userSkinType OR p.skinType = '모든피부'")
    List<Product> findMatchingProducts(@Param("userSkinType") String userSkinType);
}