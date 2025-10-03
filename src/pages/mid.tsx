import ProductsList from "../components/shop/ProductCard";

const filteredProducts =
  query === ""
    ? products
    : products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );

function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const filtered =
      query === ""
        ? products
        : products.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
          );
    setFilteredProducts(filtered);
  }, [query, products]);

  return (
    <>
      <input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ProductsList products={filteredProducts} />
    </>
  );
}

async function performSearch(searchTerm: string) {
  const lowerTerm = searchTerm.toLowerCase();
  const collections = ["amazonProducts", "localProducts", "softwareProducts"];

  const results = [];

  for (const colName of collections) {
    const colRef = collection(firestore, colName);
    const q = query(
      colRef,
      where("title", ">=", lowerTerm),
      where("title", "<=", lowerTerm + "\uf8ff")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title?.toLowerCase().includes(lowerTerm) ||
        data.name?.toLowerCase().includes(lowerTerm) ||
        data.description?.toLowerCase().includes(lowerTerm)
      ) {
        results.push({ id: doc.id, ...data });
      }
    });
  }

  return results;
}
async function onSearch(e: React.FormEvent) {
  e.preventDefault();
  if (!query) return;
  const products = await searchProducts(query);
  // handle products display or state update
}
