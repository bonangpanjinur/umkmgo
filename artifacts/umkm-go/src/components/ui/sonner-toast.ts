import { toast as sonnerToast } from "sonner";

function newOrder({
  title,
  description,
  orderId,
}: {
  title: string;
  description: string;
  orderId: string;
}) {
  sonnerToast(title, {
    description,
    duration: 8000,
    action: {
      label: "Lihat Pesanan",
      onClick: () => {
        window.location.href = "/dashboard/orders";
      },
    },
  });

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body: description, icon: "/favicon.ico" });
    } catch {}
  }
}

export const toast = {
  newOrder,
};
