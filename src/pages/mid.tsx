<section>
  {products.map((product) => (
    <div
      key={product.id}
      className="border p-4 rounded-md cursor-pointer hover:shadow-lg"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  ))}
</section>;
