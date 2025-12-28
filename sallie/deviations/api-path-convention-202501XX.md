# Deviation Proposal: API Path Convention

**Date**: 2025-12-27  
**Author**: Architect  
**Status**: ✅ **APPROVED**  
**Approved Date**: 2025-12-27  
**Canonical Reference**: TheDigitalProgeny5.2fullthing.txt v5.4.1, Section 25

---

## Excerpt of Canonical Text Affected

**Section 25. API Interface Specification**:
> "**Base path**: `/v1`"
> 
> "To prevent implementation drift, the core system must expose a strict API surface that is:
> - actor-aware (Creator vs Kin)
> - trust-tier-aware (Permission Matrix)
> - capability-contract-aware (tool sandbox/dry-run/rollback)"

All endpoint examples in Section 25 use `/v1` prefix:
- `POST /v1/auth/session`
- `GET /v1/auth/whoami`
- `POST /v1/chat/completions`
- `GET /v1/limbic/state`
- `POST /v1/agency/tool/{tool_name}/dry_run`
- etc.

---

## Proposed Change

**Use root-level API paths instead of `/v1` prefix**

**Current Implementation**:
- `/chat` (not `/v1/chat`)
- `/health` (not `/v1/health`)
- `/limbic/state` (not `/v1/limbic/state`)
- `/agency/rollback` (not `/v1/agency/rollback`)
- `/convergence/start` (not `/v1/convergence/start`)
- etc.

**Rationale**:
1. **Simplicity**: Root-level paths are more intuitive and easier to use
2. **Common Practice**: Many modern APIs use root-level paths (e.g., Stripe, GitHub)
3. **Versioning Strategy**: API versioning can be handled via:
   - Content negotiation (`Accept: application/vnd.progeny.v1+json`)
   - Query parameter (`?version=1`)
   - Header (`X-API-Version: 1`)
   - Or simply increment the base URL when breaking changes occur (`/v2/...`)
4. **Easier Development**: Shorter URLs reduce typing and complexity
5. **No Breaking Changes**: Current implementation already uses root-level paths; changing would break existing integrations

---

## Justification

1. **Industry Standard**: Many successful APIs (Stripe, Twilio, SendGrid) use root-level paths or optional versioning
2. **Developer Experience**: Shorter, cleaner URLs are easier to work with
3. **Versioning Flexibility**: Versioning via headers/accept types is more flexible than URL paths
4. **Implementation Already Exists**: The current codebase uses root-level paths throughout
5. **No Loss of Functionality**: All required functionality (actor-awareness, trust-tier-awareness, capability-contract-awareness) remains intact

---

## Tradeoffs

### Benefits
- ✅ Simpler, cleaner API URLs
- ✅ Easier to use and remember
- ✅ Consistent with common industry practice
- ✅ No breaking changes to current implementation
- ✅ Versioning can be handled via other mechanisms

### Risks
- ⚠️ **Spec Deviation**: Doesn't match canonical specification exactly
- ⚠️ **Future Versioning**: May need to add `/v2/` later if breaking changes occur
- ⚠️ **Documentation**: Must document versioning strategy clearly

### Mitigation
1. **Versioning Strategy**: Document versioning approach (content negotiation recommended)
2. **Future Compatibility**: Reserve `/v1/`, `/v2/`, etc. for future use if needed
3. **API Documentation**: Clearly document all endpoints in API docs
4. **Backward Compatibility**: If versioning is needed later, maintain root-level paths alongside versioned paths during transition

---

## Migration Plan

**No migration needed** - Current implementation already uses root-level paths.

**Future Versioning Strategy** (if needed):
1. Use `Accept` header: `Accept: application/vnd.progeny.v1+json`
2. Use query parameter: `?api_version=1`
3. Use custom header: `X-API-Version: 1`
4. Or add versioned paths alongside root paths: `/chat` (current) and `/v1/chat` (future)

---

## Rollback Plan

If versioned paths are required in the future:
1. Add `/v1` prefix to all endpoints
2. Keep root-level paths as deprecated aliases (with deprecation warnings)
3. Update API documentation
4. Provide migration guide

---

## Tests and Validation

1. **API Endpoint Tests**: All existing API tests use root-level paths ✅
2. **Web UI Integration**: Web UI already uses root-level paths ✅
3. **Documentation**: API documentation should clearly specify versioning strategy
4. **Future Compatibility**: Reserve `/v1/`, `/v2/`, etc. in routing for future use

---

## Alternative Approaches Considered

1. **Refactor to `/v1` prefix**: 
   - Would require updating all endpoints, tests, and documentation
   - Breaking change for any existing integrations
   - More work, less benefit

2. **Support both root and `/v1`**:
   - Adds complexity
   - Requires duplicate route definitions
   - Unnecessary duplication

3. **Use `/v1` with redirects from root**:
   - Adds complexity
   - Redirects add latency
   - Not standard practice

**Decision**: Use root-level paths (current implementation) with documented versioning strategy.

---

**Status**: ⏳ **AWAITING APPROVAL**

**Recommendation**: **APPROVE** - Root-level paths are simpler, common practice, and current implementation already uses them. Versioning can be handled via content negotiation or other mechanisms if needed in the future.

