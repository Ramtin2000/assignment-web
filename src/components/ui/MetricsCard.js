import React from "react";
import styled from "styled-components";
import { DashboardCard, CardTitle, CardBody } from "./Dashboard";

const MetricsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const MetricsItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[700]};
`;

const MetricsLabel = styled.span`
  font-weight: 500;
`;

const MetricsValue = styled.span`
  color: ${(props) => props.theme.colors.gray[900]};
  font-weight: 600;
`;

const MetricsSubLabel = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.gray[500]};
  margin-left: ${(props) => props.theme.spacing.xs};
`;

export const MetricsCard = ({ title, items = [], valueSuffix = "/10" }) => {
  if (!items || items.length === 0) return null;

  return (
    <DashboardCard>
      <CardTitle style={{ marginBottom: "0.5rem" }}>{title}</CardTitle>
      <CardBody>
        <MetricsList>
          {items.map((item, index) => (
            <MetricsItem key={index}>
              <MetricsLabel>{item.label}</MetricsLabel>
              <span>
                <MetricsValue>
                  {item.averageScore.toFixed(1)}
                  {valueSuffix}
                </MetricsValue>
                <MetricsSubLabel>
                  · {item.questionCount} question
                  {item.questionCount !== 1 ? "s" : ""}
                </MetricsSubLabel>
              </span>
            </MetricsItem>
          ))}
        </MetricsList>
      </CardBody>
    </DashboardCard>
  );
};

export default MetricsCard;
