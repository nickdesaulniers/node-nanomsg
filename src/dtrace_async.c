#include "shim.h"
shim_bool_t
foobar(shim_ctx_t* ctx, shim_args_t* args)
{
  /* create a new string with contents "Hello World" */
  shim_val_t* ret = shim_string_new_copy(ctx, "Hello World");
  /* set that string as the return value */
  shim_args_set_rval(ctx, args, ret);
  /* TRUE because this function didn't fail */
  return TRUE;
  /* If this were false, there probably would be an exception pending */
  /* shim_exception_pending() */
}
shim_bool_t
myinit(shim_ctx_t* ctx, shim_val_t* exports, shim_val_t* module)
{
  /* The list of C functions we want to wrap as JavaScript functions */
  shim_fspec_t funcs[] = {
    SHIM_FS(foobar), /* wrap the c function foobar, and export it as "foobar" */
    SHIM_FS_END, /* no more functions to wrap */
  };
  /* Add the list of functions to the `exports` object */
  shim_obj_set_funcs(ctx, exports, funcs);
  /* The module initialized successfully */
  return TRUE;
}
/*
 * Define a module `mymodule` whose initialization function is `myinit` which
 * will be called the first time the module is `require()`d.
 */
SHIM_MODULE(mymodule, myinit)