// @ts-nocheck
'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Simple wrapper components to bypass TypeScript issues
export const SimpleResponsiveContainer = ({ children, width, height, ...props }: any) => {
  return React.createElement(ResponsiveContainer, { width, height, ...props }, children);
};

export const SimpleAreaChart = ({ children, data, ...props }: any) => {
  return React.createElement(AreaChart, { data, ...props }, children);
};

export const SimpleBarChart = ({ children, data, ...props }: any) => {
  return React.createElement(BarChart, { data, ...props }, children);
};

export const SimpleLineChart = ({ children, data, ...props }: any) => {
  return React.createElement(LineChart, { data, ...props }, children);
};

export const SimplePieChart = ({ children, ...props }: any) => {
  return React.createElement(PieChart, props, children);
};

export const SimpleArea = (props: any) => {
  return React.createElement(Area, props);
};

export const SimpleBar = (props: any) => {
  return React.createElement(Bar, props);
};

export const SimpleLine = (props: any) => {
  return React.createElement(Line, props);
};

export const SimplePie = ({ children, ...props }: any) => {
  return React.createElement(Pie, props, children);
};

export const SimpleCell = (props: any) => {
  return React.createElement(Cell, props);
};

export const SimpleXAxis = (props: any) => {
  return React.createElement(XAxis, props);
};

export const SimpleYAxis = (props: any) => {
  return React.createElement(YAxis, props);
};

export const SimpleCartesianGrid = (props: any) => {
  return React.createElement(CartesianGrid, props);
};

export const SimpleTooltip = (props: any) => {
  return React.createElement(Tooltip, props);
};
