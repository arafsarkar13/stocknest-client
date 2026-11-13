import { Chip } from "@heroui/react";

const colors = {
  pending: "warning",
  received: "success",
  completed: "success",
  cancelled: "danger",
};

export default function StatusChip({ status }) {
  return (
    <Chip
      size="sm"
      variant="flat"
      color={colors[status] || "default"}
      className="capitalize"
    >
      {status}
    </Chip>
  );
}
