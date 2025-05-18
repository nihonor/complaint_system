import { Button, AlertDialog, Flex, Table } from "@radix-ui/themes";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { TextField } from "@radix-ui/themes";

interface Agency {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const fetchAgencies = async () => {
  try {
    const response = await fetch("/api/admin/agencies");
    const data = await response.json();
    console.log("Agencies data:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return [];
  }
};

const Agencies = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [showAddAgency, setShowAddAgency] = useState(false);
  const [newAgency, setNewAgency] = useState({
    name: "",
    email: "",
    password: "",
  });

  React.useEffect(() => {
    const loadAgencies = async () => {
      const data = await fetchAgencies();
      setAgencies(data);
    };
    loadAgencies();
  }, []);

  const deleteAgency = async (agencyId: string) => {
    try {
      setIsDeleting(true);
      await axios.delete("/api/admin/agencies/" + agencyId);
      setAgencies(agencies.filter((agency) => agency.id !== agencyId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting agency:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/agencies", newAgency);
      setAgencies([...agencies, response.data]);
      setNewAgency({
        name: "",
        email: "",
        password: "",
      });
      setShowAddAgency(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding agency:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Agency Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and monitor all registered agencies
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Agencies List
            </h2>
            <Button onClick={() => setShowAddAgency(true)}>
              Add New Agency
            </Button>
          </div>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="w-[40%]">
                  Agency Name
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-[40%]">
                  Agency Email
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-[20%] text-right">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {agencies.map((agency) => (
                <Table.Row key={agency.id} className="hover:bg-gray-50">
                  <Table.RowHeaderCell className="font-medium">
                    {agency.name}
                  </Table.RowHeaderCell>
                  <Table.Cell className="text-gray-600">
                    {agency.email}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <Button color="red" variant="soft" size="2">
                            Delete
                          </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <AlertDialog.Title>Delete Agency</AlertDialog.Title>
                          <AlertDialog.Description>
                            Are you sure you want to delete {agency.name}? This
                            action cannot be undone.
                          </AlertDialog.Description>
                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <Button variant="soft" color="gray">
                                Cancel
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button
                                color="red"
                                onClick={() => deleteAgency(agency.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete Agency"}
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>

      {/* Add Agency Modal */}
      {showAddAgency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Agency</h2>
            <form onSubmit={handleAddAgency} className="space-y-4">
              <TextField.Root>
                <TextField.Slot>
                  <input
                    type="text"
                    placeholder="Agency Name"
                    value={newAgency.name}
                    onChange={(e) =>
                      setNewAgency({ ...newAgency, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </TextField.Slot>
              </TextField.Root>
              <TextField.Root>
                <TextField.Slot>
                  <input
                    type="email"
                    placeholder="Agency Email"
                    value={newAgency.email}
                    onChange={(e) =>
                      setNewAgency({ ...newAgency, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </TextField.Slot>
              </TextField.Root>
              <TextField.Root>
                <TextField.Slot>
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAgency.password}
                    onChange={(e) =>
                      setNewAgency({ ...newAgency, password: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </TextField.Slot>
              </TextField.Root>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => setShowAddAgency(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Agency</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agencies;
