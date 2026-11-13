"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Chip, Select, SelectItem, Spinner } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { selectStyle } from "@/lib/ui";

const roles = ["admin", "manager", "staff"];

function UsersContent() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (target, role) => {
    if (!role || role === target.role) return;
    try {
      await api.patch(`/users/${target._id}/role`, { role });
      toast.success(`${target.name} is now ${role}`);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    setWorking(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success("User deleted");
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="text-white/70">
        Promote or demote team members. You cannot change your own role.
      </p>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-6 overflow-x-auto p-2"
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isMe = item._id === me.id;
                return (
                  <tr key={item._id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">
                      {item.name}{" "}
                      {isMe && (
                        <Chip size="sm" variant="flat" className="ml-1">
                          You
                        </Chip>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70">{item.email}</td>
                    <td className="w-44 px-4 py-3">
                      <Select
                        size="sm"
                        variant="bordered"
                        aria-label={`Role of ${item.name}`}
                        selectedKeys={[item.role]}
                        isDisabled={isMe}
                        disallowEmptySelection
                        onSelectionChange={(keys) =>
                          changeRole(item, Array.from(keys)[0])
                        }
                        classNames={selectStyle}
                      >
                        {roles.map((role) => (
                          <SelectItem key={role} className="capitalize">
                            {role}
                          </SelectItem>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isMe && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="danger"
                          aria-label="Delete user"
                          onPress={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={working}
        title="Delete user"
        message={`Delete ${deleteTarget?.name}? They will no longer be able to log in.`}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <UsersContent />
    </ProtectedRoute>
  );
}
