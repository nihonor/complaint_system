import { ComplaintStatus } from "@prisma/client";
import { Badge } from "@radix-ui/themes";
import React from "react";
const statusMap: Record<
  ComplaintStatus,
  { label: string; color: "red" | "violet" | "green" | "blue"|"yellow"|"orange"}
> = {
  CLOSED: { label: "Closed", color: "green" },
  IN_PROGRESS: { label: "In progress", color: "violet" },
  RESOLVED: { label: "Resolved", color: "orange" },
  SUBMITTED:{label:"Submitted",color:"blue"},
  REJECTED:{label:"Rejected",color:"red"},
  UNDER_REVIEW:{label:"Under review",color:"yellow"}

};
const IssueStatus = ({ status }: { status: ComplaintStatus }) => {
  return <Badge color={statusMap[status].color}>{statusMap[status].label}</Badge>;
};

export default IssueStatus;
