package com.keystone.controller;
import com.keystone.entity.*; import com.keystone.repository.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/technicians")
public class TechnicianController { private final UserRepository users; private final WorkOrderRepository orders; public TechnicianController(UserRepository u,WorkOrderRepository o){users=u;orders=o;}
@GetMapping @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')") public List<User> all(){return users.findAll().stream().filter(u->u.getRole()==Role.TECHNICIAN).toList();}
@GetMapping("/me/work-orders") @PreAuthorize("hasRole('TECHNICIAN')") public List<WorkOrder> mine(org.springframework.security.core.Authentication a){User u=users.findByEmail(a.getName()).orElseThrow();return orders.findAll().stream().filter(w->w.getTechnician()!=null&&w.getTechnician().getId().equals(u.getId())).toList();}
}
