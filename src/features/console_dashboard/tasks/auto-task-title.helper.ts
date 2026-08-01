import "server-only";

export function build_auto_task_title(
  task_type: string,
  entity: {
    order_number?: string;
    shipment_id?: string;
    transaction_id?: string;
    product_name?: string;
    campaign_name?: string;
  },
): string {
  switch (task_type) {
    case "order_assignment":
      return entity.order_number
        ? `Commande ${entity.order_number} — à traiter`
        : "Nouvelle commande — à traiter";
    case "shipment_assignment":
      return entity.shipment_id
        ? `Expédition ${entity.shipment_id} — à préparer`
        : "Nouvelle expédition — à préparer";
    case "payment_follow_up":
      return entity.transaction_id
        ? `Paiement ${entity.transaction_id} — relance requise`
        : "Paiement — relance requise";
    case "product_creation":
      return entity.product_name
        ? `Produit « ${entity.product_name} » — à valider`
        : "Nouveau produit — à valider";
    case "stock_receiving":
      return entity.product_name
        ? `Réception de stock — ${entity.product_name}`
        : "Réception de stock — à confirmer";
    case "campaign_review":
      return entity.campaign_name
        ? `Campagne « ${entity.campaign_name} » — à valider`
        : "Nouvelle campagne — à valider";
    default:
      return "Tâche — à traiter";
  }
}
