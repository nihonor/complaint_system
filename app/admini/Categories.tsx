import React, { useState } from "react";
import { Button, AlertDialog, Flex, Table } from "@radix-ui/themes";

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count: {
    complaints: number;
  };
}

export const fetchCategories = async () => {
  try {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();
    console.log("Categories data:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const deleteCategory = async (categoryId: string) => {
    try {
      setIsDeleting(true);
      await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Category Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and monitor all registered categories
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Categories List
            </h2>
            {/* Add New Category button/modal can go here if needed */}
          </div>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="w-[30%]">
                  Category Name
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-[40%]">
                  Description
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-[20%]">
                  Complaints Count
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="w-[10%] text-right">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map((category) => (
                <Table.Row key={category.id} className="hover:bg-gray-50">
                  <Table.RowHeaderCell className="font-medium">
                    {category.name}
                  </Table.RowHeaderCell>
                  <Table.Cell className="text-gray-600">
                    {category.description || (
                      <span className="italic text-gray-400">
                        No description
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category._count.complaints} complaints
                    </span>
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
                          <AlertDialog.Title>Delete Category</AlertDialog.Title>
                          <AlertDialog.Description>
                            Are you sure you want to delete {category.name}?
                            This action cannot be undone.
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
                                onClick={() => deleteCategory(category.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete Category"}
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
    </div>
  );
};

export default Categories;
