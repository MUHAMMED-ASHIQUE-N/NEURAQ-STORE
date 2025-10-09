{Array.isArray(product.images) && product.images.length > 0 ? (
          product.images.map((img, idx) => (
            <Link to={`/product/${product.id}`} className="block">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  key={idx}
                  src={productImage}
                  alt={`${product.name} image ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Link>
          ))
        ) : 