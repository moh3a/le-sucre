// TODO: implement
// Log on: login success/fail, logout, role assign, permission denied, admin API access.
//
// export class AuditService {
//   constructor(private readonly repo = new AuditRepository()) {}

//   async log(input: {
//     actor_user_id?: string;
//     action: string;
//     resource_type?: string;
//     resource_id?: string;
//     metadata?: Record<string, unknown>;
//     ip_address?: string;
//     user_agent?: string;
//   }) {
//     await this.repo.insert({
//       ...input,
//       metadata: input.metadata ? JSON.stringify(input.metadata) : null,
//     });
//   }
// }
//
// export const audit_service = new AuditService();
