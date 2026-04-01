/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetTeamMembersResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";


export const getTeamMembers = async (params: Record<string, any>): Promise<GetTeamMembersResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.TEAM_MEMBERS.LIST, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch team members",
      team_members: [],
    };
  }
};
