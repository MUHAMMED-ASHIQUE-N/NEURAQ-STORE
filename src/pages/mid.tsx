{
  order.items.map((item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const totalPrice = currency(price * qty);

    const orderDate = order.createdAt?.toDate
      ? order.createdAt.toDate()
      : new Date(order.createdAt);
    const dateString = orderDate.toLocaleDateString();

    return (
      <div key={item.id} className="flex items-center gap-3">
        <img
          src={item.image}
          alt={item.name}
          className="h-14 w-14 rounded-md object-cover"
        />
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">Qty: {qty}</div>
        </div>
        <div className="text-right text-sm font-medium">{totalPrice}</div>
      </div>
    );
  });
}

<div className="text-sm">{dateString}</div>;
