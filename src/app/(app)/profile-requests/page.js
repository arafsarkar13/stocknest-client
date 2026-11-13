"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Chip,
  Select,
  SelectItem,
  Spinner,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import ProtectedRoute from "@/components/ProtectedRoute";
import { inputStyle, selectStyle, modalStyle } from "@/lib/ui";

const labels = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
};
const statuses = ["pending", "approved", "rejected", "cancelled"];
const colors = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "default",
};

function RequestsContent() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState("");
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/profile-requests", {
        params: { status },
      });
      setRequests(data.requests);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const approve = async (request) => {
    setWorkingId(request._id);
    try {
      await api.patch(`/profile-requests/${request._id}/approve`, {});
      toast.success("Request approved and profile updated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const reject = async () => {
    setWorkingId(rejecting._id);
    try {
      await api.patch(`/profile-requests/${rejecting._id}/reject`, { note });
      toast.success("Request rejected");
      setRejecting(null);
      setNote("");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Profile requests</h1>
      <p className="text-white/70">
        Review changes that users want to make to their own details.
      </p>

      <div className="glass mt-6 p-4 sm:max-w-xs">
        <Select
          label="Status"
          variant="bordered"
          selectedKeys={[status]}
          onSelectionChange={(keys) =>
            setStatus(Array.from(keys)[0] || "pending")
          }
          classNames={selectStyle}
        >
          {statuses.map((item) => (
            <SelectItem key={item} className="capitalize">
              {item}
            </SelectItem>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="glass mt-6 p-10 text-center text-white/70">
          No {status} requests.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {requests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
              className="glass p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{request.user?.name}</p>
                  <p className="text-xs text-white/50">{request.user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="flat" className="capitalize">
                    {request.user?.role}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={colors[request.status]}
                    className="capitalize"
                  >
                    {request.status}
                  </Chip>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {Object.entries(request.changes).map(([field, value]) => (
                  <li key={field} className="rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/50">{labels[field]}: </span>
                    <span className="text-white/50 line-through">
                      {request.previous?.[field] || "empty"}
                    </span>
                    {" → "}
                    <span className="font-medium">{value || "empty"}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-xs text-white/50">
                Requested {formatDateTime(request.createdAt)}
                {request.reviewedBy?.name &&
                  ` · reviewed by ${request.reviewedBy.name}`}
              </p>
              {request.reviewNote && (
                <p className="mt-1 text-xs text-white/60">
                  Note: {request.reviewNote}
                </p>
              )}

              {request.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    color="success"
                    startContent={<Check size={14} />}
                    isLoading={workingId === request._id}
                    onPress={() => approve(request)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<X size={14} />}
                    onPress={() => setRejecting(request)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!rejecting}
        onClose={() => setRejecting(null)}
        backdrop="blur"
        classNames={modalStyle}
      >
        <ModalContent>
          <ModalHeader>Reject request</ModalHeader>
          <ModalBody>
            <Textarea
              label="Reason (optional, the user will see it)"
              variant="bordered"
              value={note}
              onValueChange={setNote}
              classNames={inputStyle}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button color="danger" onPress={reject} isLoading={!!workingId}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function ProfileRequestsPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <RequestsContent />
    </ProtectedRoute>
  );
}
