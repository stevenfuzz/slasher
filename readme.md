slashr node insync MC Application Api Framework.

Rapid dev...

*Abv Key:
*child / chd
*children / chn
*parent / prt
*layout / lyt
*view / vw
*controller / ctlr
*template / tpl
*action / act
*entity / ent
*domain / dm
*model / mdl
*container / cntr
*method / meth
*form / fm
*element / elmt
*widget / wgt
*button / btn
*submit / sbm
*link / lk
*description / desc
*error / err
*control / ctrl
*success / succ
*label / lbl
*name / nm
*validator / vld
*validators / vlds
*request / req
*redirect / rdr
*forward / fwd
*data / dt
*router / rtr
*route / rt
*item / itm
*items / itms
*menu / mn
*submenu / sbmn
*overlay / ovl
*backdrop / bkdp
*filter / fltr
*binding(s) / bind
*content / cont
*target / trg
*element / e
*event / evt
*required / rqd
*component / cpnt
*type / tp
*file / f
*percent / pct
*cache / csh

// Style
If it is an instance of a class (like database, storage, cache), 
it would be parent.class(instanceName).child. If it is the default instance then parent.class.child

If the class is a factory that returns instantiated children, like database row / col, the same applies as above.

```javascript
// Database query
this.mdl.db.qry();
// Query a differant instance
this.mdl.db("myInstance").qry();
// Storage create file with instance
this.mdl.stor("myInstance").file();
this.mdl.stor.file();
```

For base classes like form, file, menu, entities the parent class can be directly instantiated like parent.class(), 
or the child can be instantiated with parent.class.child()

```javascript
// Base Form
this.mdl.form();
// Custom form in /model/forms
this.mdl.form.login();

// Get a custom file type class
this.mdl.stor.file.img();
// Create a swimple view model
this.mdl.vw();
// custom view model
this.mdl.vw.login();

// Entity defined in entities.js
this.mdl.ent.users();

// The Domain Model is technically both an instance and a child class, so it is used like forms, but the parent is abstract
// Get the account domain class
this.mdl.dm.account();

// Result types
this.rslt.file("myfile.pdf"); // returns a file located in assets/files/myfile.pdf
```