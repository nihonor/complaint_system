import prisma from "@/prisma/client";
import { Avatar, Flex, Table } from "@radix-ui/themes";
import React from "react";

import Link from "next/link";
import { start } from "repl";
import ComplaintStatus from "./components/ComplaintStatus";

const LatestComplaint = async () => {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <Table.Root>
        <Table.Body>
          {complaints.map((complaint) => (
            <Table.Row key={complaint.id}>
              <Table.Cell>
                <Flex justify={"between"}>
                  <Flex direction="column" align="start" gap="2">
                    <Link href={`/complaint/${complaint.id}`}>{complaint.title}</Link>
                    <ComplaintStatus status={complaint.status} />
                  </Flex>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default LatestComplaint;
