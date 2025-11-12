package faceTime.product;

import lombok.Getter;

public class ProductDto {

    @Getter
    public static class ProductResponse {
        private Long productId;
        private String name;
        private String skinType;
        private String description;

        public ProductResponse(Product product) {
            this.productId = product.getProductId();
            this.name = product.getName();
            this.skinType = product.getSkinType();
            this.description = product.getDescription();
        }
    }
}