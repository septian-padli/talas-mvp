import { User } from "@prisma/client";
import {
  UserDetail,
  UserListItem,
  UserListResponse,
  UserQueryFilters,
  UpdateUserProfileDTO,
} from "./types/user";

export * from "./types/user";

/**
 * Data contracts, type definitions, DTOs, and cross-module facades for User module.
 * External modules MUST communicate with User domain exclusively through this interface file.
 */

export interface IUserService {
  getById(id: string): Promise<User | null>;
  updateProfile(userId: string, data: UpdateUserProfileDTO): Promise<User>;
}

export interface IUserAggregator {
  getByUsername(username: string, currentUserId?: string): Promise<UserDetail | null>;
  listUsers(filters: UserQueryFilters, currentUserId?: string): Promise<UserListResponse>;
}

// Service Facade (Strict WRITE Operations)
export const UserService: IUserService = {
  async getById(id: string) {
    const { userService } = await import("./services/user.service");
    return userService.getById(id);
  },
  async updateProfile(userId: string, data: UpdateUserProfileDTO) {
    const { userService } = await import("./services/user.service");
    return userService.updateProfile(userId, data);
  },
};

// Aggregator Facade (Permissive READ Operations & JOINs)
export const UserAggregator: IUserAggregator = {
  async getByUsername(username: string, currentUserId?: string) {
    const { userAggregator } = await import("./user.aggregator");
    return userAggregator.getByUsername(username, currentUserId);
  },
  async listUsers(filters: UserQueryFilters, currentUserId?: string) {
    const { userAggregator } = await import("./user.aggregator");
    return userAggregator.listUsers(filters, currentUserId);
  },
};
